from selenium import webdriver
from bs4 import BeautifulSoup
import time
import re


def setup_driver():
    """Set up Selenium Remote WebDriver connected to Selenium Grid."""
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")  # Run in headless mode
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    # Connect to Selenium Grid running locally in Docker
    driver = webdriver.Remote(
        command_executor="http://localhost:4444/wd/hub",  # Selenium Hub URL
        options=options
    )
    return driver

def filter_unwanted_content(text):
    """
    Dynamically filters out unwanted content (e.g., cookie notices, navigation text).
    """
    # Split text into lines
    lines = text.splitlines()

    # Heuristic 1: Remove short lines (often navigation or repetitive text)
    lines = [line for line in lines if len(line.strip()) > 20]

    # Heuristic 2: Remove lines containing common unwanted keywords
    unwanted_keywords = [
        "cookie", "cookies", "skip", "navigation", "menu", "footer", "header",
        "accept", "reject", "privacy", "policy", "terms", "conditions", "read more",
        "learn more", "click here", "subscribe", "newsletter", "advertisement", "advert",
    ]
    lines = [line for line in lines if not any(keyword in line.lower() for keyword in unwanted_keywords)]

    # Heuristic 3: Remove duplicate lines (often repetitive content)
    unique_lines = []
    for line in lines:
        if line not in unique_lines:
            unique_lines.append(line)

    # Join the filtered lines back into a single string
    return "\n".join(unique_lines)

def extract_all_text(html):
    """Extracts all meaningful text from an HTML page."""
    soup = BeautifulSoup(html, "lxml")

    # Remove unwanted tags like scripts, styles, footers, headers, etc.
    for tag in soup(["script", "style", "header", "footer", "nav", "aside", "form", "noscript"]):
        tag.extract()  # Remove the tag from the parsed HTML

    # Extract text from all relevant tags
    text_elements = soup.find_all(["p", "a"])

    extracted_text = "\n".join([element.get_text(strip=True) for element in text_elements])

    # Clean text: remove excessive spaces and special characters
    extracted_text = re.sub(r"\n+", "\n", extracted_text)  # Replace multiple newlines with a single newline
    extracted_text = re.sub(r"\s{2,}", " ", extracted_text)  # Replace multiple spaces with a single space

    # Dynamic filtering of unwanted content
    extracted_text = filter_unwanted_content(extracted_text)

    return extracted_text.strip()


def scrape_and_save(url: str, id):
    driver = setup_driver()

    try:
        driver.get(url)
        time.sleep(5)

        # Get page source (HTML)
        page_html = driver.page_source
        driver.quit()

        cleaned_text = extract_all_text(page_html)

        return cleaned_text

    except Exception as e:
        print(f"Error: {e}")
        driver.quit()
