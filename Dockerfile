FROM nginx:alpine

# Copy static portal files
COPY ./web /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
