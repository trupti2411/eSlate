<?php

/*
 * Cross-Origin Resource Sharing — explicit config so the React frontend
 * (deployed to its own Render service / custom dev.eslate.com.au) can
 * call /api/* on the Laravel service from a different origin.
 *
 * Token-based auth (Sanctum Bearer) does NOT need credentialed CORS —
 * keep supports_credentials false so we can keep allowed_origins permissive
 * during dev without browser security yelling.
 */

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'healthz'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://eslate-frontend.onrender.com',
        'https://dev.eslate.com.au',
        'https://eslate.com.au',
    ],

    'allowed_origins_patterns' => [
        // Render preview URLs follow eslate-frontend-pr-NNN.onrender.com
        '#^https://eslate-frontend(-pr-\d+)?\.onrender\.com$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
