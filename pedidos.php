<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pizza - Pedido Guardado</title>
    <meta name="description" content="Procesa el pedido, lo guarda en un archivo de texto y muestra su contenido">
</head>
<body>
    <h1>Pedido Guardado</h1>

<?php
$ar = fopen("pizza_edson.txt", "a") or die("Problemas en la creación del archivo");

fputs($ar, "\n");
fputs($ar, "Nombre: " . $_REQUEST['Nombre']);
fputs($ar, "\n");
fputs($ar, "Dirección: " . $_REQUEST['Direccion']);
fputs($ar, "\n");

if (isset($_REQUEST['JamonyQueso'])) {
    fputs($ar, "Cantidad de Jamón y Queso: " . $_REQUEST['Cant1']);
    fputs($ar, "\n");
}

if (isset($_REQUEST['Napolitana'])) {
    fputs($ar, "Cantidad de Napolitana: " . $_REQUEST['Cant2']);
    fputs($ar, "\n");
}

if (isset($_REQUEST['Mozzarella'])) {
    fputs($ar, "Cantidad de Mozzarella: " . $_REQUEST['Cant3']);
    fputs($ar, "\n");
}

fputs($ar, "--------------------------------------------------------------");
fputs($ar, "\n");

fclose($ar);

echo "<p>Los datos se cargaron correctamente.</p>";
echo "<h2>Contenido del archivo pizza_edson.txt</h2>";

$ar = fopen("pizza_edson.txt", "r") or die("No se pudo abrir el archivo");

while (!feof($ar)) {
    $linea = fgets($ar);
    echo nl2br($linea);
}

fclose($ar);
?>

</body>
</html>