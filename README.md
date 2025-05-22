# Attio Deals Python Script

A Python script to interact with the Attio API for creating or updating "DEAL" objects.

## Features

-   Fetch attribute definitions for the "deals" object.
-   Create or update "deals" records using a matching attribute (upsert behavior).

## Setup

### 1. Prerequisites

-   Python 3.x
-   `requests` library

### 2. Installation

```bash
pip install requests
```

### 3. Configuration

1.  Open `attio_deals.py`.
2.  Replace the placeholder value for `ATTIO_API_KEY = "YOUR_API_KEY_HERE"` with your actual Attio API key.
3.  **Security Note**: Your Attio API key is sensitive. Handle it securely. For advanced use cases, consider loading it from environment variables or a secure configuration file. The current script reads it directly for simplicity.

## Usage

### 1. Understanding Your Deal Attributes

-   Before asserting deals, you need the `api_slug` for each attribute you want to set (e.g., deal name, value, stage).
-   The script provides `get_object_definition("deals")`. You can temporarily uncomment the example call in the `if __name__ == "__main__":` block in `attio_deals.py` and run `python attio_deals.py` to list all attributes for your "deals" object. Note down the `api_slug` for the attributes you need.

### 2. Running the Script

1.  Modify the `example_deal_attributes` dictionary in the `if __name__ == "__main__":` block in `attio_deals.py` with the actual attribute slugs and values for the deal you want to create/update.
2.  Set the `matching_attribute_slug` variable to the `api_slug` of an attribute that uniquely identifies a deal (e.g., a unique deal ID or name, if names are unique).
3.  Run the script:
    ```bash
    python attio_deals.py
    ```

### 3. Output

-   The script will print the API response for the asserted deal, or an error message if something went wrong.

## Example

The `if __name__ == "__main__":` block in `attio_deals.py` contains an example of how to structure the `deal_attributes` (as `example_deal_attributes`) and call `assert_deal`.

## Important Notes

-   This script is specifically tailored for "DEAL" objects in Attio.
-   Ensure your API key has the necessary permissions (`record_permission:read-write` for "deals" and `object_configuration:read` for "deals").