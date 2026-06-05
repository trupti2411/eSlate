<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // ESLATE-5: Australian schools typeahead source. Defaults to the
    // data.gov.au CKAN datastore API; set SCHOOLS_API_RESOURCE_ID to the
    // ACARA "Australian Schools List" resource to enable live lookups.
    // When the resource id is absent the schools field falls back to free text.
    'schools' => [
        'url'         => env('SCHOOLS_API_URL', 'https://data.gov.au/data/api/3/action/datastore_search'),
        'resource_id' => env('SCHOOLS_API_RESOURCE_ID'),
    ],

];
