# install nodejs

npm install -g hexo-cli

# init hexo 
hexo init hexo
cd hexo

npm install
# modify _config.yml
npm install hexo-deployer-git --save
npm config set registry https://registry.npm.taobao.org

# preview

hexo generate 
hexo server

# deploy on git
hexo clean
hexo generate
hexo server





