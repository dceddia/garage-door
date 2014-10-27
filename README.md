garage-door
===========

Garage door sensor and opener using a Raspberry Pi and Sinatra.

config.json
-----------

Create a config.json file similar to this (replace the pins with your own):

If this file does not exist, the app will not start.

    {
      open_pin   : 14,        // required
      closed_pin : 15,        // required
      relay_pin  : 18,        // required
      secrets_file: '/usr/local/share/garage-door-secrets.json'       // required
      enable_text_messages: true,     // optional
    }

secrets_file points to the secrets.json file described next.

secrets.json
------------

Rather than check in my password and Twilio credentials, it's broken out into a file loaded at runtime.

If this file doesn't exist when you start up the app, it will prompt you for the values.

secrets.json should look similar to this:

    {
      password: 'SuperSecret',
      twilio_account_sid: ABC123,
      twilio_auth_token:  ABC123
    }

