# opentera-webportal-service

OpenTera Service managing a customizable webportal

## Setup

```bash
# Clone GitHub repository with submodules
git clone https://github.com/introlab/opentera-webportal-service.git --recurse-submodule

# Go to webportal-service directory
cd opentera-webportal-service directory

# Create a virtual environment
This supposes Python 3.8.x was correctly installed on the build system.

### On Mac/Linux:
# Automated script
Just run create_conda_venv.sh

# OR manual installation
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

### On Windows:
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt

```
