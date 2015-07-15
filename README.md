# Template for a Single-Page Front-End Development

Install requirements  with

    $ npm install

Uses gulp. Run

    $ gulp

to build, serve, watch and autoreload the content.

Live Reload functionality requires the browser extension - I didn't tell
Express to add the script to HTML files on export (can be done with
connect-livereload).

For distribution run

    $ gulp dist

Output is in out/dist