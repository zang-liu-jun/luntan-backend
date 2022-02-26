FROM node

WORKDIR /my-app

RUN npm install -g forever

COPY ./package.json /my-app/

RUN npm install

COPY . /my-app/

EXPOSE 8088

CMD forever /my-app/app.js 