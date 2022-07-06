#FROM robinhoodis/ubuntu:latest
#FROM phusion/baseimage:jammy-1.0.0
FROM phusion/baseimage:focal-1.2.0
USER root

# Update base image
RUN apt-get -qq update && \
  apt-get -qq dist-upgrade

# Add the partner repository
RUN apt-get -y -qq install software-properties-common && \
  apt-add-repository "deb http://archive.canonical.com/ubuntu $(lsb_release -sc) partner"

ENV DISPLAY=:99
ENV DISPLAY_CONFIGURATION=1664x936x30
ENV DBUS_SESSION_BUS_ADDRESS=/dev/null
ENV DEBIAN_FRONTEND noninteractive

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
# Install NodeJS
RUN curl --silent --location https://deb.nodesource.com/setup_18.x | bash - && \
  apt-get -qq install nodejs && \
  npm install -g npm@latest

RUN apt-get update
RUN apt-get -y install gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libnss3 lsb-release xdg-utils wget libgbm-dev ffmpeg gnupg gnupg2 apt-utils software-properties-common curl xvfb x11vnc fluxbox wmctrl tmux default-jre sudo unzip python3 python3-pip x11-utils gnumeric xserver-xephyr tigervnc-standalone-server bc icewm xorg xauth xinit xfonts-base xterm tigervnc-standalone-server tigervnc-common pulseaudio-utils pavucontrol xdotool fonts-noto sakura libvte-dev ubuntu-gnome-desktop jq gpg libasound2 libxshmfence1 apt-transport-https psmisc dbus-x11 xauth xinit x11-xserver-utils xdg-utils mousepad libdrm2 libgbm1 libxcb-dri3-0 

#ENV NODE_VERSION=16.5
#ENV NVM_DIR=/root/.nvm
#RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
#RUN . "$NVM_DIR/nvm.sh" \
#    && nvm install ${NODE_VERSION}
#RUN . "$NVM_DIR/nvm.sh" \
#    && nvm use v${NODE_VERSION}
#RUN . "$NVM_DIR/nvm.sh" \
#    && nvm alias default v${NODE_VERSION}
#ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
#RUN apt-get update \
#    && apt-get install -y --no-install-recommends npm
RUN npm install -g yarn
ENV GEOMETRY 1664x936

RUN pip3 install selenium
RUN pip3 install ffmpeg-python
# use either pip3 or apt-get to install powerline
#RUN pip3 install powerline-status

RUN groupadd -g 1000 ubuntu
RUN useradd -rm -d /home/ubuntu -s /bin/bash -g 1000 -G sudo -u 1000 ubuntu
RUN chown -R ubuntu:ubuntu /home/ubuntu

RUN usermod -a -G sudo ubuntu \
  && echo 'ALL ALL = (ALL) NOPASSWD: ALL' >> /etc/sudoers \
  && echo 'ubuntu:secret' | chpasswd

RUN add-apt-repository universe
RUN apt-get update
RUN apt-get -y install powerline fonts-powerline

# Copy the fonts into place instead
COPY Fonts /usr/share/fonts/windows
#RUN apt-add-repository multiverse
#RUN apt-get update
#RUN echo "ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true" | debconf-set-selections
#RUN apt-get install -y --no-install-recommends fontconfig ttf-mscorefonts-installer

#ADD localfonts.conf /etc/fonts/local.conf
COPY fonts.conf /etc/fonts/local.conf
RUN fc-cache -f -v

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list
RUN apt-get update
RUN apt-get install yarn -y

RUN apt-get update && apt-get install -y wget --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /src/*.deb

#==================
# Chrome webdriver
#==================
RUN CHROMEDRIVER_VERSION=`curl -sS chromedriver.storage.googleapis.com/LATEST_RELEASE` && \
    mkdir -p /opt/chromedriver-$CHROMEDRIVER_VERSION && \
    curl -sS -o /tmp/chromedriver_linux64.zip http://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip && \
    unzip -qq /tmp/chromedriver_linux64.zip -d /opt/chromedriver-$CHROMEDRIVER_VERSION && \
    rm /tmp/chromedriver_linux64.zip && \
    chmod +x /opt/chromedriver-$CHROMEDRIVER_VERSION/chromedriver && \
    ln -fs /opt/chromedriver-$CHROMEDRIVER_VERSION/chromedriver /usr/bin/chromedriver

# It's a good idea to use dumb-init to help prevent zombie chrome processes.
RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64
RUN chmod +x /usr/local/bin/dumb-init

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/google-chrome

#COPY local.conf /etc/fonts/local.conf
WORKDIR /home/ubuntu
#COPY package.json /home/ubuntu
#COPY index.js /home/ubuntu
#RUN npm i

ENV NODE_PATH /usr/local/lib/node_modules/npm/node_modules/:/usr/local/lib/node_modules
#RUN yarn global add npm
RUN npm --location-global config set user root
RUN npm install --prefix /usr/local/lib --location-global --unsafe-perm puppeteer
RUN npm install --prefix /usr/local/lib --location-global --unsafe-perm puppeteer-screen-recorder
RUN npm install --prefix /usr/local/lib --location-global --unsafe-perm puppeteer-autoscroll-down
RUN npm install --prefix /usr/local/lib --location-global --unsafe-perm yargs
RUN npm install --prefix /usr/local/lib --location-global --unsafe-perm delay
RUN npm install --prefix /usr/local/lib --location-global --unsafe-perm ghost-cursor

#RUN yarn global add puppeteer
#RUN yarn global add puppeteer-screen-recorder
#RUN yarn global add yargs
#RUN yarn global add delay
#RUN yarn global add ghost-cursor

RUN echo '[daemon]' > /etc/gdm3/custom.conf \
    && echo 'WaylandEnable=false' >> /etc/gdm3/custom.conf \
    && echo 'DefaultSession=gnome-xorg.desktop' >> /etc/gdm3/custom.conf \
    && echo 'AutomaticLoginEnable = true' >> /etc/gdm3/custom.conf \
    && echo 'AutomaticLogin = ubuntu' >> /etc/gdm3/custom.conf \
    && echo '[security]' >> /etc/gdm3/custom.conf \
    && echo '[xdmcp]' >> /etc/gdm3/custom.conf \
    && echo '[chooser]' >> /etc/gdm3/custom.conf \
    && echo '[debug]' >> /etc/gdm3/custom.conf \
    && echo 'Enable=false' >> /etc/gdm3/custom.conf

################
### stage_vscode
################

ENV \
    DONT_PROMPT_WSL_INSTALL=1 \
    FEATURES_VSCODE=1

RUN \
    curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg \
    && install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/ \
    && sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list' \
    && apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y code

###########
### Postman
###########
RUN wget -qO- https://dl.pstmn.io/download/latest/linux64 | tar -xz -C "/opt" \
    && ln -s /opt/Postman/Postman /usr/local/bin/postman

USER ubuntu

