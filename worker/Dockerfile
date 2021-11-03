# pull official base image
FROM node:stretch

# set working directory
WORKDIR /usr/app

# add `/node_modules/.bin` to $PATH
ENV PATH /usr/app/node_modules/.bin:$PATH

RUN apt-get update && \
    apt-get install -y unoconv poppler-utils inotify-tools

# install app dependencies
COPY package.json package-lock.json /usr/app/
RUN npm ci

# add app
COPY . ./

# start app
CMD ["npm", "start"]