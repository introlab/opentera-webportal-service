echo "Starting postresql"
service postgresql start
echo "Starting redis-server"
#service redis-server start
redis-server &
echo "Sleeping 5 secs."
sleep 5
echo "Starting TeraServer"
(cd /opentera/teraserver/python && $PYTHON3_EXEC ./TeraServer.py&)
echo "Sleeping 15 secs before launching opentera-teleop-service."
sleep 15
echo "Starting opentera-webportal-service"
(cd /opentera-webportal-service && $PYTHON3_EXEC ./TeleopService.py)
