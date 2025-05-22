# Placeholder for Attio API key
ATTIO_API_KEY = "YOUR_API_KEY_HERE"

# Import requests library
import requests

# Base URL for Attio API
ATTIO_API_BASE_URL = "https://api.attio.com/v2"

# Function to list attributes (to be added later)

def get_object_definition(object_slug):
    """
    Fetches the attribute definitions for a given object slug from the Attio API.

    Args:
        object_slug (str): The slug of the object (e.g., "companies", "people").

    Returns:
        list: A list of attribute definitions if successful, None otherwise.
              The API key 'ATTIO_API_KEY' needs to be replaced with a real key.
    """
    if ATTIO_API_KEY == "YOUR_API_KEY_HERE":
        print("Error: Please replace 'YOUR_API_KEY_HERE' with your actual Attio API key.")
        return None

    url = f"{ATTIO_API_BASE_URL}/objects/{object_slug}/attributes"
    headers = {
        "Authorization": f"Bearer {ATTIO_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.json().get("data")
        else:
            print(f"Error fetching object definition for '{object_slug}':")
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"An error occurred during the API request: {e}")
        return None

def assert_deal(deal_attributes, matching_attribute):
    """
    Asserts a deal record in Attio. This means it creates a new deal or updates
    an existing one if a deal with a matching value for the `matching_attribute`
    is found.

    Args:
        deal_attributes (dict): A dictionary where keys are attribute slugs and
                                values are the corresponding values for the deal.
        matching_attribute (str): The slug of the attribute to use for matching
                                  existing deals (e.g., "name", "deal_id").

    Returns:
        dict: The data of the created or updated deal record if successful, None otherwise.
              The API key 'ATTIO_API_KEY' needs to be replaced with a real key.
    """
    if ATTIO_API_KEY == "YOUR_API_KEY_HERE":
        print("Error: Please replace 'YOUR_API_KEY_HERE' with your actual Attio API key.")
        return None

    object_slug = "deals"
    url = f"{ATTIO_API_BASE_URL}/objects/{object_slug}/records"
    
    params = {"matching_attribute": matching_attribute}
    
    json_payload = {"data": {"values": deal_attributes}}
    
    headers = {
        "Authorization": f"Bearer {ATTIO_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.put(url, headers=headers, params=params, json=json_payload)
        if response.status_code == 200:
            return response.json().get("data")
        else:
            print(f"Error asserting deal:")
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"An error occurred during the API request: {e}")
        return None

if __name__ == "__main__":
    # IMPORTANT: Replace "YOUR_API_KEY_HERE" at the top of this file with your actual Attio API key.
    
    # Example 1: Get object definition for "deals"
    # This helps you understand the available attributes and their slugs for deals.
    # Make sure your ATTIO_API_KEY is set before uncommenting and running this.
    # print("\nFetching deal object definition...")
    # if ATTIO_API_KEY != "YOUR_API_KEY_HERE":
    #     deal_attributes_info = get_object_definition("deals")
    #     if deal_attributes_info:
    #         print("Deal Attributes:")
    #         for attr in deal_attributes_info:
    #             print(f"  - Slug: {attr.get('api_slug')}, Title: {attr.get('title')}, Type: {attr.get('type')}")
    #     else:
    #         print("Could not fetch deal attributes. Ensure API key is correct and you have internet access.")
    # else:
    #     print("Skipping get_object_definition example as API key is not set.")

    print("\nExample: Asserting a deal")
    print("-------------------------")
    print("Note: The attribute slugs ('name', 'deal_value', 'deal_stage') used below are examples.")
    print("Use get_object_definition('deals') (example above, requires API key) to find the correct slugs for your Attio workspace.")

    if ATTIO_API_KEY == "YOUR_API_KEY_HERE":
        print("\nPlease set your ATTIO_API_KEY at the top of the file to run the assert_deal example.")
    else:
        # Example deal attributes. Adjust slugs and values based on your Attio setup.
        # Common attribute slugs might be 'name', 'deal-value', 'status' or 'deal-stage'.
        # Verify these against your Attio workspace's "deals" object attributes by uncommenting Example 1.
        example_deal_attributes = {
            "name": "Big Corp Q4 Contract",      # Example: Name of the deal (usually a text attribute)
            "deal_value": 50000,                 # Example: Monetary value of the deal (currency or number attribute)
            "deal_stage": "Proposal Sent"        # Example: Current stage of the deal (likely a select attribute)
        }
        
        # The attribute slug to use for matching. If a deal with this 'name' exists, it will be updated.
        # Otherwise, a new deal will be created.
        # This should be an attribute that uniquely identifies a deal, or one you want to use for upserting.
        # 'name' is used here as an example.
        matching_attribute_slug = "name" 

        print(f"\nAttempting to assert deal with attributes: {example_deal_attributes}")
        print(f"Matching based on attribute: '{matching_attribute_slug}'")
        
        created_or_updated_deal = assert_deal(example_deal_attributes, matching_attribute_slug)

        if created_or_updated_deal:
            print("\nAssert deal successful!")
            print("Response data:")
            # Pretty print the JSON response if possible, otherwise just print the dict
            try:
                import json
                print(json.dumps(created_or_updated_deal, indent=2))
            except ImportError:
                print(created_or_updated_deal)
            except Exception as e: # Catching a broader exception for json.dumps if it fails for other reasons
                print(f"Could not pretty print JSON response: {e}")
                print(created_or_updated_deal)
        else:
            print("\nAssert deal failed. Check previous error messages in the console.")
