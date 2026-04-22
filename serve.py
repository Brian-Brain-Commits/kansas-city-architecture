import http.server, os
os.chdir('/Users/brian.soetaert/Desktop/Claude Co-Work')
http.server.test(HandlerClass=http.server.SimpleHTTPRequestHandler, port=8765, bind='127.0.0.1')
