# Country Blocking with NGINX (Ansible)

This folder contains an Ansible playbook and templates that configure NGINX to block requests from specific countries using the GeoIP2 module and the free MaxMind GeoLite2 City database.

The goal is to give you a reliable, repeatable way to:
- Install the GeoLite2 database on your servers.
- Build and load the `ngx_http_geoip2_module` that works with your installed NGINX version.
- Declare useful GeoIP2 variables (country code, country name, city, etc.).
- Mark requests from selected countries and return HTTP 451 for them.

## What the Playbook Does
- Checks the host is Debian/Ubuntu (apt-based).
- Downloads and installs the GeoLite2 City database into `/usr/share/GeoIP/`.
- Detects the installed NGINX version, downloads the matching source, and compiles the GeoIP2 module as a dynamic module.
- Ensures the module is loaded via `/etc/nginx/modules-enabled/99-geoip2.conf`.
- Deploys a single, clean GeoIP2 configuration to `/etc/nginx/conf.d/geo-blocking.conf` using a Jinja2 template.
- Injects a server-level snippet into every `server { ... }` block that returns `451` for blocked countries.
- Removes duplicate GeoIP2 City declarations from other configs to avoid conflicts.
- Validates the NGINX configuration and reloads the service.

## Files
- `provision-geo-blocking.yml`: Main Ansible playbook that performs all tasks end-to-end.
- `templates/nginx-blocking.conf.j2`: Template that declares GeoIP2 variables and maps countries to a block flag.
- `templates/geo-block-server-451.conf.j2`: Snippet included in each `server {}` that returns `451` when a request is marked as blocked.
- `group_vars/`: Variables automatically loaded by Ansible. The file `group_vars/all.yml` defines values used by the template, especially `blocked_countries`.
- `example.all.yml`: Example of `group_vars/all.yml` with a sample `blocked_countries` list. Copy/adjust it to `group_vars/all.yml` for your environment.
- `inventory.ini`: Example inventory with the `webservers` group.
- `example.secrets.yml`: Example secrets file showing how to provide the MaxMind license key.
- `secrets.yml`: Your real secrets file (not committed) with `maxmind_license_key`.

## Requirements
- Debian/Ubuntu hosts with NGINX installed.
- Ansible control machine with network access to fetch sources and the GeoLite2 database.
- A MaxMind account and license key for GeoLite2 downloads (free). Put it in `secrets.yml`.

Example `secrets.yml`:
```yaml
maxmind_license_key: "YOUR_MAXMIND_LICENSE_KEY"
```

## Quick Start
1. Edit `inventory.ini` and set your hosts under the `webservers` group.
2. Put your MaxMind key into `blocking-countries-with-nginx/secrets.yml`.
3. Put your a list of blocked_countries into `blocking-countries-with-nginx/group_vars/all.yml`.
4. Configure which countries to block, and how the client IP is chosen (see Variables below).
5. Run:
   ```bash
   ansible-playbook -i blocking-countries-with-nginx/inventory.ini blocking-countries-with-nginx/provision-geo-blocking.yml
   ```

If everything is fine, the playbook will validate the NGINX config and reload it.

## Variables You Can Change
These are defined in the playbook or in `group_vars/` and can be overridden if needed.

- `geoip_dir` (default: `/usr/share/GeoIP`): Where the `.mmdb` database is placed.
- `nginx_modules_dir` (default: `/usr/lib/nginx/modules`): Where the compiled module is installed.
- `geoip2_module_commit`: Pinned commit of the GeoIP2 module used for building.
- `geoip_source` (default: `"remote_addr"`): How to get the client IP for the lookup.
  - `"remote_addr"`: safest if you are not behind a proxy.
  - `"xff"`: trust the `X-Forwarded-For` header (only in trusted networks or behind a known proxy/CDN).
- `blocked_countries`: ISO 3166-1 alpha-2 country codes to block.
  - Recommended place to set: `group_vars/all.yml` (affects all hosts).
  - You can also override via host vars, group vars, or `--extra-vars`.
  - See `example.all.yml` for a simple example list.

## How Blocking Works
- The GeoIP2 template (`nginx-blocking.conf.j2`) loads the City database and declares variables such as:
  - `$geoip2_country_code`, `$geoip2_data_country_iso_code`, `$geoip2_data_country_name`, `$geoip2_data_city_name`, state name/code, postal code, latitude, longitude, and `time_zone`.
- A `map` sets `$is_blocked_country` to `1` for selected country codes.
- A small server-level snippet (`geo-block-server-451.conf.j2`) is included at the top of every `server {}` block:
  ```nginx
  if ($is_blocked_country = 1) {
      return 451;
  }
  ```
- The playbook removes duplicate GeoLite2 City declarations from other configs to keep only one clear definition.

## Testing the Result
- Run `nginx -t` on the server to check configuration validity.
- Reload manually if needed: `sudo systemctl reload nginx`.
- To simulate a client from a country, you can test through a proxy/VPN, or if you use `geoip_source: "xff"`, send a header:
  ```bash
  curl -H "X-Forwarded-For: 1.2.3.4" https://your.domain
  ```
  Replace `1.2.3.4` with an IP from a country you expect to be blocked. You should see HTTP 451.

## Safety Notes
- The playbook makes backups when it changes NGINX configs. It tries to avoid re-writing existing backup files.
- Only one GeoIP2 City block should exist. The playbook removes duplicates.
- Building the module requires basic build tools, which the playbook installs.

## Troubleshooting
- Missing GeoIP2 variables: If `nginx -t` says a variable is unknown (for example `geoip2_data_*`), ensure the template is deployed and the module is loaded. Re-run the playbook.
- Version with suffix: Some distros print a version like `1.24.0 (Ubuntu)`. The playbook strips the suffix and downloads the correct NGINX source tarball.
- Behind a proxy/CDN: Set `geoip_source: "xff"` and make sure you only trust headers from your proxy/CDN.
- Backups growing: The playbook filters known backup patterns and keeps further edits minimal.

## Undo / Clean Up
- Remove `/etc/nginx/conf.d/geo-blocking.conf` and the snippet `/etc/nginx/snippets/geo-block-server-451.conf`.
- Remove the module load file `/etc/nginx/modules-enabled/99-geoip2.conf` if you no longer need GeoIP2.
- Reload NGINX.

This setup focuses on being reproducible and clear. Feel free to adapt the templates and variables to your environment.
