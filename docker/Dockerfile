# Image: introlab3it/opentera_webportal_service
# LABEL version="0.1"
# LABEL description="OpenTera Webportal."
FROM introlab3it/openteraserver

# RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
#        python3-pip python3-venv python3

# Setup Service at root directory
WORKDIR /
RUN git clone --recurse-submodules -b main https://github.com/introlab/opentera-webportal-service.git

# Change shell to bash
SHELL ["/bin/bash", "-c"]


# Volumes
VOLUME /opentera-webportal-service/config
VOLUME /opentera-webportal-service/static

# Create venv
WORKDIR /opentera-webportal-service
RUN $PYTHON3_EXEC -m venv venv

# Install requirements
ENV $PYTHON3_EXEC /opentera-webportal-service/venv/bin/python
RUN venv/bin/python3 -m pip install -r requirements.txt
RUN $PYTHON3_EXEC --version

# Commands
CMD nginx -c /opentera/teraserver/python/config/nginx.conf -p /opentera/teraserver/python/config/ && ./start_docker.sh
