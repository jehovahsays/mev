<?php
header_remove( 'X-Powered-By' );
header( 'Cache-control: none, no-cache, private, max-age=0' );
header( 'Pragma: no-cache' );
header( 'Content-Type-Options: nosniff' );
header( 'X-Content-Type-Options: nosniff' );
header( 'XSS-Protection: 1; mode=block' );
header( 'X-XSS-Protection: 1; mode=block' );
header( 'Vary: Accept-Encoding' );
header( 'viewport: width=device-width, initial-scale=1.0' );
header( 'Accept-Language: en-US,en;q=0.5' );
header( 'Connection: Keep-alive' );
header( 'Host: blackhole' );
header( 'description: blackhole' );
header( 'keywords: blackhole' );
header( 'Vary: Accept-Encoding' );
header( 'Expires: 0' );
header( 'Referrer-Policy:  same-origin' );
header( 'Accept-Language: en-US,en;q=0.5' );
header( 'Connection: Keep-alive' );

foreach($_POST as $variable => $value) 
{
	$value = str_replace(' ', '_', $value);	
	$file_pointer = "./en/" . $value . ".html"; 						
	if (file_exists($file_pointer))  
	{ 
	echo "The file $file_pointer already exists <br>"; 
	//echo "<meta name='viewport' content='width=device-width'>Click the link to visit the webpage you created for the keyword<br><br><a href='./en/$value.html'>$value</a><br><br>";
	echo "<script> var msg = new SpeechSynthesisUtterance('the keyword $value was spectated'); window.speechSynthesis.speak(msg); </script>";
	//echo "<body onload='loadout()'><script>function loadout(){window.location.href = './vandal.html'}</script>";	
	echo "<body onload='loadout()'><script>function loadout(){window.location.href = './en/$value.html'}</script>";
	exit();
	}
}

foreach($_POST as $variable => $value) 
{
	

$answer1 = $_POST['secure-form-answer-Human'];        
$totalCorrect = 1;  
if ($answer1 == "Human") { $totalCorrect++; }            
echo "<div id='results'>$totalCorrect /  1 correct</div>";

 echo "<meta name='viewport' content='width=device-width'>deleted <br> <a href='./en/$value.html'>$value</a>";
 echo "<body onload='loadout()'><script>function loadout(){window.location.href = './index.htm'}</script>";
 echo "<script> var msg = new SpeechSynthesisUtterance('you deleted the keyword'); window.speechSynthesis.speak(msg); </script>";		
fclose($handle);
exit();
?>

