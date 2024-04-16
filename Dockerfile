FROM nginx:latest
COPY public /usr/share/nginx/html
RUN chown -R $(id -u):$(id -g) /usr/share/nginx/html
EXPOSE 80
