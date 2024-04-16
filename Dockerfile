FROM nginx:latest
COPY ./bingo /usr/share/nginx/html
RUN chown -R $(id -u):$(id -g) /usr/share/nginx/html
EXPOSE 80
