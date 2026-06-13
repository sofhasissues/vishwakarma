import pdfplumber
import io
import asyncio
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig
from crawl4ai.extraction_strategy import JsonCssExtractionStrategy
import json


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract raw text from PDF bytes."""
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """Extract text from PDF or DOCX."""
    if filename.lower().endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif filename.lower().endswith(".docx"):
        from docx import Document
        doc = Document(io.BytesIO(file_bytes))
        return "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
    else:
        raise ValueError(f"Unsupported file type: {filename}")


async def scrape_url(url: str) -> str:
    """Scrape a URL and return clean markdown text."""
    config = CrawlerRunConfig(
        word_count_threshold=50,
        remove_overlay_elements=True,
        page_timeout=30000,
    )
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=url, config=config)
        if result.success:
            return result.markdown[:8000]  # cap at 8k chars per page
        return ""


def build_search_urls(role: str, location: str) -> list[dict]:
    """Build search URLs for all 4 platforms."""
    role_encoded = role.replace(" ", "%20")
    role_plus = role.replace(" ", "+")
    location_encoded = location.replace(" ", "%20")
    location_plus = location.replace(" ", "+")

    return [
        {
            "source": "naukri",
            "url": f"https://www.naukri.com/{role_plus.lower().replace('%20', '-')}-jobs-in-{location_plus.lower().replace('%20', '-')}"
        },
        {
            "source": "internshala",
            "url": f"https://internshala.com/jobs/{role_plus.lower().replace('%20', '-')}-jobs-in-{location_plus.lower().replace('%20', '-')}"
        },
        {
            "source": "wellfound",
            "url": f"https://wellfound.com/jobs?q={role_encoded}&l={location_encoded}"
        },
        {
            "source": "linkedin",
            "url": f"https://www.linkedin.com/jobs/search/?keywords={role_encoded}&location={location_encoded}"
        },
    ]


async def scrape_all_platforms(role: str, location: str) -> list[dict]:
    """Scrape all platforms and return raw markdown per source."""
    urls = build_search_urls(role, location)
    results = []
    for item in urls:
        try:
            markdown = await scrape_url(item["url"])
            if markdown:
                results.append({
                    "source": item["source"],
                    "url": item["url"],
                    "content": markdown
                })
        except Exception as e:
            print(f"Failed to scrape {item['source']}: {e}")
    return results
