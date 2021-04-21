from flask_restx import Resource, reqparse
from FlaskModule import default_api_ns as api

# Parser definition(s)
get_parser = api.parser()


class QueryVersion(Resource):

    def __init__(self, _api, *args, **kwargs):
        Resource.__init__(self, _api, *args, **kwargs)
        self.module = kwargs.get('flaskModule', None)
        self.parser = reqparse.RequestParser()

    @api.expect(get_parser)
    @api.doc(description='Gets the service version',
             responses={200: 'Success - Return the service version'})
    # @ServiceAccessManager.token_required
    def get(self):
        version = {'WebPortalService': {'version': '1.0.0'}
                   }
        return version
