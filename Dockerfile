FROM node:latest

# See https://crbug.com/795759
RUN apt-get update && apt-get install -yq libgconf-2-4 gnupg ca-certificates

# Install latest chrome dev package and fonts to support major 
# charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version 
# of Chromium that Puppeteer
# installs, work.
RUN apt-get update
RUN apt-get -y install gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libnss3 lsb-release xdg-utils wget libgbm-dev ffmpeg
# libappindicator1
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
COPY package.json /home/ubuntu
COPY index.js /home/ubuntu
RUN npm i
#RUN yarn add puppeteer
#RUN yarn add puppeteer-screen-recorder
#RUN yarn add yargs
#RUN yarn add delay
#RUN yarn add ghost-cursor

USER ubuntu

#EXPOSE 8084
#ENTRYPOINT ["dumb-init", "--"]
#CMD ["npm", "run", "start"]
