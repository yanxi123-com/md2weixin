FROM keymetrics/pm2:18-alpine

RUN mkdir /work

COPY . /work

WORKDIR /work

RUN npm install --force

RUN npm run build

EXPOSE 8081

CMD ["npm", "run", "start"]
