# pull official base image
FROM node:alpine

# set working directory
WORKDIR /usr/app

# add `/node_modules/.bin` to $PATH
ENV PATH /usr/app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json package-lock.json /usr/app/
RUN npm ci

# add app
COPY . ./

# start app
CMD ["nodemon", "server"]