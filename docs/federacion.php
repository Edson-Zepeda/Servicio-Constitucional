<?php 
//mostrar errores
$saml_lib_path = '/var/www/simplesaml/src/_autoload.php';
// echo __DIR__ . $saml_lib_path;
require_once($saml_lib_path);
// // Fuente de autenticacion definida en el authsources del SP ej, default-sp
$SP_ORIGEN = getenv('SOURCE');
// Se crea la instancia del saml, pasando como parametro la fuente de autenticacion.
$as = new \SimpleSAML\Auth\Simple($SP_ORIGEN);
$as->requireAuth();
$attributes = $as->getAttributes();
//obtener cada atributo con foreach
foreach ($attributes as $key => $value) {
    echo $key . " => " . $value[0] . "<br>";
}
