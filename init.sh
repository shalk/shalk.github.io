#!/bin/bash
set -e
# install nodejs
if  !  which node 
then
  echo "node command no exist ! "
  echo "Please install nodejs first !"
  exit 1
fi

if  !  which hexo 
then
  echo "hexo command no exist ! "
  echo "Please install hexo first !"
  echo "npm install -g hexo-cli "
  exit 1
fi

npm config set registry https://registry.npm.taobao.org

npm install -g hexo-cli

# init hexo 
# hexo init hexo
# cd hexo

npm install
# modify _config.yml

npm install hexo-deployer-git --save

# preview

hexo generate 

hexo server


# deploy on git
#hexo clean
#hexo generate
#hexo server
#




