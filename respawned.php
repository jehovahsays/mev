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
header( 'Location: ./index.html' );

    $ip = $localIp = gethostbyname(gethostname());

	if(isset($localIp)){
    echo $localIp;
}else{
    echo 'No ip Set';
}	
	$handle = fopen("./en/leaderboard.html", "a");
    fwrite($handle,
      "<script> var msg = new SpeechSynthesisUtterance('new player respawned'); window.speechSynthesis.speak(msg); </script>"
	. "<br>new player respawned \r\n \r\n");
    fclose($handle);
    exit();
?>