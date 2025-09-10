FROM phpmyadmin:apache
COPY ./000-default.conf /etc/apache2/sites-available/000-default.conf
COPY .htaccess /var/www/html/
COPY .htpasswd /var/www/html/
RUN service apache2 restart
EXPOSE 80
