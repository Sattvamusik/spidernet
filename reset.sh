#!/bin/bash
echo "💥 Resetting SpiderNet..."
rm -rf ~/.spidernet ~/.local/bin/spn
curl -fsSL https://raw.githubusercontent.com/omvatayan/spidernet/main/install.sh | bash
