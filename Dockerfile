FROM node:8.10.0

WORKDIR /app/

COPY package.json .
RUN npm install

COPY src/ ./src/

EXPOSE 5000

RUN node --version
RUN whereis node
RUN echo $PATH

CMD ["node", "src/index.js"]