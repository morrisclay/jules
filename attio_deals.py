# Import requests library
import requests
import os
from flask import Flask, request, jsonify

# Base URL for Attio API
ATTIO_API_BASE_URL = "https://api.attio.com/v2"

app = Flask(__name__)

def get_object_definition_impl(api_key, object_slug):
    """
    Fetches the attribute definitions for a given object slug from the Attio API.
    Implementation function.
    """
    if not api_key:
        return {"error": "API key is required."}, 400

    url = f"{ATTIO_API_BASE_URL}/objects/{object_slug}/attributes"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raises an HTTPError for bad responses (4XX or 5XX)
        return response.json().get("data"), 200
    except requests.exceptions.HTTPError as http_err:
        return {
            "error": f"HTTP error fetching object definition for '{object_slug}'",
            "status_code": response.status_code,
            "details": response.text
        }, response.status_code
    except requests.exceptions.RequestException as e:
        return {"error": f"Request exception: {e}"}, 500
    except Exception as e:
        return {"error": f"An unexpected error occurred: {e}"}, 500


@app.route("/get_object_definition", methods=["POST"])
def get_object_definition_route():
    data = request.get_json()
    api_key = data.get("attio_api_key")
    object_slug = data.get("object_slug")

    if not object_slug:
        return jsonify({"error": "object_slug is required."}), 400
    
    result, status_code = get_object_definition_impl(api_key, object_slug)
    return jsonify(result), status_code


def assert_deal_impl(api_key, deal_attributes, matching_attribute):
    """
    Asserts a deal record in Attio.
    Implementation function.
    """
    if not api_key:
        return {"error": "API key is required."}, 400

    object_slug = "deals"
    url = f"{ATTIO_API_BASE_URL}/objects/{object_slug}/records"
    
    params = {"matching_attribute": matching_attribute}
    json_payload = {"data": {"values": deal_attributes}}
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.put(url, headers=headers, params=params, json=json_payload)
        response.raise_for_status() # Raises an HTTPError for bad responses (4XX or 5XX)
        return response.json().get("data"), 200
    except requests.exceptions.HTTPError as http_err:
        return {
            "error": f"HTTP error asserting deal",
            "status_code": response.status_code,
            "details": response.text
        }, response.status_code
    except requests.exceptions.RequestException as e:
        return {"error": f"Request exception: {e}"}, 500
    except Exception as e:
        return {"error": f"An unexpected error occurred: {e}"}, 500

@app.route("/assert_deal", methods=["POST"])
def assert_deal_route():
    data = request.get_json()
    api_key = data.get("attio_api_key")
    deal_attributes = data.get("deal_attributes")
    matching_attribute = data.get("matching_attribute")

    if not deal_attributes or not matching_attribute:
        return jsonify({"error": "deal_attributes and matching_attribute are required."}), 400
    
    result, status_code = assert_deal_impl(api_key, deal_attributes, matching_attribute)
    return jsonify(result), status_code


if __name__ == "__main__":
    # It's recommended to get the API key from an environment variable for security
    # For local testing, you can still set it here if you prefer, but environment variables are better.
    ATTIO_API_KEY_FROM_ENV = os.environ.get("ATTIO_API_KEY")

    if not ATTIO_API_KEY_FROM_ENV:
        print("Warning: ATTIO_API_KEY environment variable not set.")
        print("The Flask app will run, but API calls will fail without an API key provided in requests.")

    print("Starting Flask server for Attio tools on port 5003 (default for Flask in dev).")
    print("Endpoints available:")
    print("  POST /get_object_definition Body: {\"attio_api_key\": \"<key>\", \"object_slug\": \"<slug>\"}")
    print("  POST /assert_deal Body: {\"attio_api_key\": \"<key>\", \"deal_attributes\": {...}, \"matching_attribute\": \"<attr_slug>\"}")
    
    # Example usage (these would now be called via HTTP POST requests to the server)
    # To test these functions, you would use a tool like curl or Postman to send POST requests
    # to the running Flask application.

    # Example 1: How to conceptualize testing get_object_definition
    # You would send a POST to http://localhost:5003/get_object_definition with JSON body:
    # {
    #   "attio_api_key": "YOUR_ACTUAL_API_KEY",
    #   "object_slug": "deals"
    # }
    # if ATTIO_API_KEY_FROM_ENV:
    #     print("\nTesting get_object_definition_impl (simulated)...")
    #     deal_attrs_info, status = get_object_definition_impl(ATTIO_API_KEY_FROM_ENV, "deals")
    #     if status == 200:
    #         print("Deal Attributes Info:")
    #         for attr in deal_attrs_info:
    #             print(f"  - Slug: {attr.get('api_slug')}, Title: {attr.get('title')}, Type: {attr.get('type')}")
    #     else:
    #         print(f"Error in get_object_definition_impl: {deal_attrs_info}")
    # else:
    #     print("\nSkipping get_object_definition_impl test as API key from env is not set.")

    # Example 2: How to conceptualize testing assert_deal
    # You would send a POST to http://localhost:5003/assert_deal with JSON body:
    # {
    #   "attio_api_key": "YOUR_ACTUAL_API_KEY",
    #   "deal_attributes": {
    #     "name": "Big Corp Q4 Contract from Flask",
    #     "deal_value": 75000,
    #     "deal_stage": "Negotiation"
    #   },
    #   "matching_attribute": "name"
    # }
    # if ATTIO_API_KEY_FROM_ENV:
    #     print("\nTesting assert_deal_impl (simulated)...")
    #     example_deal_attributes = {
    #         "name": "New Test Deal via Flask Impl",
    #         "deal_value": 12345,
    #         "deal_stage": "Initial Contact"
    #     }
    #     matching_attribute_slug = "name"
    #     created_deal, status = assert_deal_impl(ATTIO_API_KEY_FROM_ENV, example_deal_attributes, matching_attribute_slug)
    #     if status == 200:
    #         print("\nAssert deal (impl) successful!")
    #         try:
    #             import json
    #             print(json.dumps(created_deal, indent=2))
    #         except ImportError:
    #             print(created_deal)
    #     else:
    #         print(f"\nAssert deal (impl) failed: {created_deal}")
    # else:
    #     print("\nSkipping assert_deal_impl test as API key from env is not set.")

    # Run the Flask app.
    # Consider using a more production-ready WSGI server like gunicorn if this were for production.
    # For development, Flask's built-in server is fine.
    # Changing port to 5003 to avoid potential conflicts with other services.
    app.run(host="0.0.0.0", port=5003, debug=True)
