FROM node

ADD . /app
WORKDIR /app

RUN npm install
EXPOSE 18080

CMD npm start
