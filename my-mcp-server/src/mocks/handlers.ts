import { http, HttpResponse } from 'msw';

const PYTHON_API_BASE_URL = "http://localhost:5003";

export const handlers = [
  // Mock for attio_get_object_definition
  http.post(`${PYTHON_API_BASE_URL}/get_object_definition`, async ({ request }) => {
    const body = await request.json() as { attio_api_key?: string; object_slug?: string };

    if (!body.attio_api_key) {
      return HttpResponse.json({ error: 'API key is required by mock.' }, { status: 400 });
    }
    if (body.object_slug === 'nonexistent_slug') {
      return HttpResponse.json({ error: 'Object slug not found by mock' }, { status: 404 });
    }
    if (body.object_slug === 'error_slug') {
      return HttpResponse.json({ error: 'Internal server error from mock' }, { status: 500 });
    }
    if (body.object_slug === 'valid_slug') {
      return HttpResponse.json(
        [{ api_slug: 'name', title: 'Name', type: 'text' }, { api_slug: 'deal_value', title: 'Deal Value', type: 'currency' }],
        { status: 200 }
      );
    }
    // Default fallback if none of the specific conditions are met, though ideally test cases should cover specific mocks.
    return HttpResponse.json({ error: 'Unhandled mock condition for get_object_definition' }, { status: 400 });
  }),

  // Mock for attio_assert_deal
  http.post(`${PYTHON_API_BASE_URL}/assert_deal`, async ({ request }) => {
    const body = await request.json() as { attio_api_key?: string; deal_attributes?: any; matching_attribute?: string };

    if (!body.attio_api_key) {
      return HttpResponse.json({ error: 'API key is required by mock.' }, { status: 400 });
    }
    if (!body.deal_attributes || Object.keys(body.deal_attributes).length === 0) {
        return HttpResponse.json({ error: 'Deal attributes are required by mock.' }, { status: 400 });
    }
    if (body.matching_attribute === 'error_match') {
      return HttpResponse.json({ error: 'Internal server error from mock during assert' }, { status: 500 });
    }
    if (body.matching_attribute) {
      return HttpResponse.json(
        { id: 'record_id_123', object: 'deals', values: body.deal_attributes },
        { status: 200 }
      );
    }
    // Default fallback
    return HttpResponse.json({ error: 'Unhandled mock condition for assert_deal' }, { status: 400 });
  }),
];
