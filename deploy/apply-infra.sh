#!/usr/bin/env bash
# Applique l'infra Sommet Volley de façon idempotente et SCOPÉE.
# Ne touche PAS : pterodactyl, site default, autres vhosts, données jeu hors WEB_ROOT.
#
# Usage (sur le serveur, depuis le staging) :
#   DEPLOY_USER=ubuntu TURN_SECRET=… TURN_URLS=… ./deploy/apply-infra.sh
# Options :
#   APPLY_NGINX=1   (défaut) installe le vhost ns3104412… et retire l'ancien blobby-volley.conf
#   APPLY_SYSTEMD=1 (défaut) installe/update sommet-mm.service + drop-in TURN si secret fourni
#   APPLY_COTURN=0  (défaut) ne touche pas coturn ; passer 1 pour sync l'exemple (sans écraser un secret existant sauf si FORCE_COTURN=1)
set -euo pipefail

DEPLOY_USER="${DEPLOY_USER:?DEPLOY_USER requis}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APPLY_NGINX="${APPLY_NGINX:-1}"
APPLY_SYSTEMD="${APPLY_SYSTEMD:-1}"
APPLY_COTURN="${APPLY_COTURN:-0}"
FORCE_COTURN="${FORCE_COTURN:-0}"
NGINX_NAME="ns3104412.ip-37-187-139.eu.conf"
OLD_NGINX_NAMES=("blobby-volley.conf")

if [[ "$APPLY_SYSTEMD" == "1" ]]; then
  echo "== systemd sommet-mm =="
  unit_src="$SCRIPT_DIR/systemd/sommet-mm.service"
  unit_dst="/etc/systemd/system/sommet-mm.service"
  tmp="$(mktemp)"
  sed "s/DEPLOY_USER/${DEPLOY_USER}/g" "$unit_src" > "$tmp"
  sudo cp "$tmp" "$unit_dst"
  rm -f "$tmp"
  sudo mkdir -p /etc/systemd/system/sommet-mm.service.d
  if [[ -n "${TURN_SECRET:-}" ]]; then
    urls="${TURN_URLS:-turn:37.187.139.122:3478?transport=udp,turn:37.187.139.122:3478?transport=tcp}"
    sudo tee /etc/systemd/system/sommet-mm.service.d/turn.conf >/dev/null <<EOF
[Service]
Environment=TURN_SECRET=${TURN_SECRET}
Environment=TURN_URLS=${urls}
EOF
    sudo chmod 640 /etc/systemd/system/sommet-mm.service.d/turn.conf
    echo "  drop-in turn.conf écrit (secret fourni)"
  else
    echo "  TURN_SECRET absent — drop-in existant conservé s'il y en a un"
  fi
  sudo systemctl daemon-reload
  sudo systemctl enable sommet-mm >/dev/null 2>&1 || true
  if systemctl cat sommet-mm >/dev/null 2>&1; then
    sudo systemctl restart sommet-mm
    echo "  sommet-mm redémarré"
  fi
fi

if [[ "$APPLY_NGINX" == "1" ]]; then
  echo "== nginx vhost =="
  src="$SCRIPT_DIR/nginx/$NGINX_NAME"
  [[ -f "$src" ]] || { echo "manque $src"; exit 1; }
  sudo cp "$src" "/etc/nginx/sites-available/$NGINX_NAME"
  # sites-enabled : lien symbolique propre
  sudo rm -f "/etc/nginx/sites-enabled/$NGINX_NAME"
  sudo ln -s "/etc/nginx/sites-available/$NGINX_NAME" "/etc/nginx/sites-enabled/$NGINX_NAME"
  for old in "${OLD_NGINX_NAMES[@]}"; do
    if [[ -e "/etc/nginx/sites-enabled/$old" || -L "/etc/nginx/sites-enabled/$old" ]]; then
      sudo rm -f "/etc/nginx/sites-enabled/$old"
      echo "  retiré sites-enabled/$old"
    fi
    # garde une copie dated en available si l'ancien fichier réel existait
    if [[ -f "/etc/nginx/sites-available/$old" && "$old" != "$NGINX_NAME" ]]; then
      sudo mv -f "/etc/nginx/sites-available/$old" \
        "/etc/nginx/sites-available/${old}.bak-renamed-$(date +%Y%m%d)" || true
      echo "  archivé sites-available/$old"
    fi
  done
  sudo nginx -t
  sudo systemctl reload nginx
  echo "  nginx reload OK ($NGINX_NAME)"
fi

if [[ "$APPLY_COTURN" == "1" ]]; then
  echo "== coturn =="
  if ! command -v turnserver >/dev/null 2>&1; then
    echo "  coturn non installé — sudo apt-get install -y coturn (manuel / une fois)"
  elif [[ -f /etc/turnserver.conf && "$FORCE_COTURN" != "1" ]]; then
    echo "  /etc/turnserver.conf existe déjà — skip (FORCE_COTURN=1 pour écraser)"
  else
    if [[ -z "${TURN_SECRET:-}" ]]; then
      echo "  TURN_SECRET requis pour écrire turnserver.conf"; exit 1
    fi
    tmp="$(mktemp)"
    sed "s/CHANGE_ME/${TURN_SECRET}/g" "$SCRIPT_DIR/coturn/turnserver.conf.example" > "$tmp"
    sudo cp "$tmp" /etc/turnserver.conf
    rm -f "$tmp"
    sudo chmod 640 /etc/turnserver.conf
    if [[ -f /etc/default/coturn ]]; then
      sudo sed -i 's/#*TURNSERVER_ENABLED=.*/TURNSERVER_ENABLED=1/' /etc/default/coturn || true
    fi
    sudo systemctl enable --now coturn
    sudo systemctl restart coturn
    echo "  coturn mis à jour"
  fi
fi

echo "OK apply-infra (scopé Sommet)"
