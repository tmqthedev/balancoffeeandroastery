# Mock certificates for local testing
#
# These certificates are for local development only.
# Never use them in production environments.

mkdir -p test-cert
cd test-cert

# Generate a self-signed certificate for local testing
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"

echo "Test certificates generated successfully!"
