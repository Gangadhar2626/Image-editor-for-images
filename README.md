# Canvas Studio

A lightweight mobile-first image editor that runs in the browser and can be installed as a PWA.

## Features

- Upload or replace an image from a phone
- Brightness, contrast, saturation, and quick filters
- Export the edited image as a PNG
- Offline shell through a service worker
- AI edit panel prepared for the Hugging Face Gradio service

The supplied model's `/gradio_api/info` endpoint was unavailable during setup, so the AI adapter currently reports service/schema status rather than guessing an API endpoint. Set the exact Gradio `api_name` and request mapping in `app.js` once the model schema is reachable.
