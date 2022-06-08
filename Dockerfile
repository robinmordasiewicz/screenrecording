FROM node:latest
LABEL name "puppeteraas"

# See https://crbug.com/795759
RUN apt-get update && apt-get install -yq libgconf-2-4 gnupg ca-certificates

# Install latest chrome dev package and fonts to support major 
# charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version 
# of Chromium that Puppeteer
# installs, work.
RUN apt-get update && apt-get install -y wget --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /src/*.deb

# It's a good idea to use dumb-init to help prevent zombie chrome processes.
RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64
RUN chmod +x /usr/local/bin/dumb-init

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/google-chrome

# Add user so we don't need --no-sandbox.
RUN usermod -u 1001 node && \
    groupmod -g 1001 node && \
    chown -R node:node /home/node

RUN groupadd -r -g 1000 ubuntu && useradd -r -g ubuntu -u 1000 -G audio,video -m ubuntu \
    && chown -R ubuntu:ubuntu /home/ubuntu

#COPY local.conf /etc/fonts/local.conf
WORKDIR /home/ubuntu
RUN yarn add puppeteer
RUN yarn add yargs
RUN yarn add delay

#COPY package.json /home/ubuntu
#COPY index.js /home/ubuntu
#RUN npm i

USER ubuntu

#EXPOSE 8084
#ENTRYPOINT ["dumb-init", "--"]
#CMD ["npm", "run", "start"]
