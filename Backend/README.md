# Opentera Webportal Service

OpenTera Service managing a customizable webportal

## Database pre-configuration
Create an empty database with the parameters set in the [config file](https://github.com/introlab/opentera-webportal-service/blob/main/Backend/config/WebPortalService.json) (or the parameters that are setup in your configuration)

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
