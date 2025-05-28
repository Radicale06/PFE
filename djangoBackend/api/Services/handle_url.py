import os
from selenium import webdriver
from bs4 import BeautifulSoup
import time
import re
import requests
from lxml import etree
import gzip
from io import BytesIO
from urllib.parse import urljoin, urlparse
from dotenv import load_dotenv
load_dotenv()

def _fetch_sitemap_content_silent(sitemap_url: str, session: requests.Session):
    try:
        response = session.get(sitemap_url, timeout=20, headers={'User-Agent': 'SitemapParser/1.0'})
        response.raise_for_status()
        content = response.content
        if sitemap_url.endswith(".gz") or "gzip" in response.headers.get('Content-Type', '').lower():
            try:
                content = gzip.decompress(content)
            except gzip.BadGzipFile:
                # Silently try to parse as is or fail if it's truly corrupted
                pass
        return content
    except requests.RequestException:
        return None
    except Exception:
        return None


def _parse_sitemap_xml_silent(xml_content: bytes) -> tuple[list[str], list[str]]:
    page_urls = []
    child_sitemap_urls = []
    if not xml_content:
        return page_urls, child_sitemap_urls

    try:
        parser = etree.XMLParser(recover=True, remove_blank_text=True, no_network=True)
        root = etree.fromstring(xml_content, parser=parser)

        sitemap_locs = root.xpath("//*[local-name()='sitemap']/*[local-name()='loc']/text()")
        if sitemap_locs:
            for loc in sitemap_locs:
                child_sitemap_urls.append(loc.strip())
            return page_urls, child_sitemap_urls

        url_locs = root.xpath("//*[local-name()='url']/*[local-name()='loc']/text()")
        for loc in url_locs:
            page_urls.append(loc.strip())

    except etree.XMLSyntaxError:
        pass
    except Exception:
        pass

    return page_urls, child_sitemap_urls


def get_all_urls_from_sitemaps_silent(website_root_url: str) -> list[str]:
    session = requests.Session()
    all_page_urls = set()
    sitemaps_to_process = []
    processed_sitemap_urls = set()

    if not website_root_url.endswith('/'):
        website_root_url += '/'

    robots_url = urljoin(website_root_url, "robots.txt")
    try:
        response = session.get(robots_url, timeout=10)
        if response.status_code == 200:
            for line in response.text.splitlines():
                if line.lower().strip().startswith("sitemap:"):
                    sitemap_url = line.split(":", 1)[1].strip()
                    if sitemap_url not in processed_sitemap_urls and sitemap_url not in sitemaps_to_process:
                        sitemaps_to_process.append(sitemap_url)
    except requests.RequestException:
        pass

    common_sitemap_paths = [
        "sitemap.xml", "sitemap_index.xml", "sitemap.xml.gz",
        "sitemap_index.xml.gz", "sitemap_news.xml", "sitemaps.xml", "sitemap/sitemap.xml"
    ]
    for path in common_sitemap_paths:
        common_sitemap_url = urljoin(website_root_url, path)
        if common_sitemap_url not in sitemaps_to_process and common_sitemap_url not in processed_sitemap_urls:
            sitemaps_to_process.append(common_sitemap_url)

    queue_idx = 0
    while queue_idx < len(sitemaps_to_process):
        current_sitemap_url = sitemaps_to_process[queue_idx]
        queue_idx += 1

        if current_sitemap_url in processed_sitemap_urls:
            continue

        processed_sitemap_urls.add(current_sitemap_url)

        sitemap_content = _fetch_sitemap_content_silent(current_sitemap_url, session)
        if sitemap_content:
            page_urls_from_current, child_sitemaps_from_current = _parse_sitemap_xml_silent(sitemap_content)

            for page_url in page_urls_from_current:
                all_page_urls.add(page_url)

            for child_sitemap_url in child_sitemaps_from_current:
                absolute_child_sitemap_url = urljoin(current_sitemap_url, child_sitemap_url)
                if absolute_child_sitemap_url not in processed_sitemap_urls and \
                        absolute_child_sitemap_url not in sitemaps_to_process:
                    sitemaps_to_process.append(absolute_child_sitemap_url)

    return sorted(list(all_page_urls))
def setup_driver():
    """Set up Selenium Remote WebDriver connected to Selenium Grid."""
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")  # Run in headless mode
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    # Connect to Selenium Grid running locally in Docker
    driver = webdriver.Remote(
        command_executor=os.getenv('SELINIUM'),  # Selenium Hub URL
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


