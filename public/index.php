<?php
require '../.env';

header(header: "Access-Control-Allow-Origin:*");
header(header: "Content-Type: application/json; charset=UTF-8");
header(header: "Access-Control-Allow-Methods: OPTIONS,GET,POST,PUT,DELETE");
header(header: "Access-Control-Max-Age: 3600");
header(header: "Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, XRequested-With");


$servername = "localhost";
$username = "root";
$password = getenv(name: 'PASSWORD');

$request = $_SERVER['REQUEST_METHOD'];

// Create an if statement to check if this is a GET request

    // Her håndterer vi GET-request
    $conn = new PDO(dsn: "mysql:host=$servername;dbname=mul2025", username: $username, password: $password);

    // set the PDO error mode to exception
    $conn->setAttribute(attribute: PDO::ATTR_ERRMODE, value: PDO::ERRMODE_EXCEPTION);

    $uri = parse_url(url: $_SERVER['REQUEST_URI'], component: PHP_URL_PATH);


// Backend til lazy loading/bæredygtighed - vi vil kun have vist de 3 seneste pips og så tilføje en knap i vores frontend, hvor vi kan hente flere pips ned - skal være sammenkoblet til vores JS og DB

    if ($request == "GET" && $uri == "/pips") {
    
      try {
        // Læs query-parametre: limit og offset
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 10;
        $offset = isset($_GET['offset']) ? (int) $_GET['offset'] : 0;
      
        // Rimelige grænser/validering
        if ($limit < 1) $limit = 1;
        if ($limit > 100) $limit = 100; // undgå alt for store svar
        if ($offset < 0) $offset = 0;
      
        // (Valgfrit) total antal rækker til metadata
        $total = (int) $conn->query(query: "SELECT COUNT(*) FROM pips")->fetchColumn();
      
        // Hent pagineret data – bind som ints!
        $stmt = $conn->prepare(query: "SELECT * FROM pips ORDER BY piptime DESC LIMIT :limit OFFSET :offset");
        $stmt->bindValue(param: ':limit', value: $limit, type: PDO::PARAM_INT);
        $stmt->bindValue(param: ':offset', value: $offset, type: PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(mode: PDO::FETCH_ASSOC);
      
        // Returnér data + pagination-info
        echo json_encode(value: [
            'data' => $rows,
            'pagination' => [
                'limit' => $limit,
                'offset' => $offset,
                'total' => $total,
                'next_offset' => ($offset + $limit < $total) ? $offset + $limit : null,
                'prev_offset' => ($offset - $limit >= 0) ? $offset - $limit : null
            ]
        ]);
      } catch(PDOException $e) {
        http_response_code(response_code: 500);
        echo json_encode(value: ["error" => "Connection failed: " . $e->getMessage()]);
      }
}
     // else check if this is a POST request and write "You wrote a POST request" back
     else if ($request === 'POST' && $uri === '/pips') {
      $input = (array) json_decode(json: file_get_contents(filename: 'php://input'), associative: true);
      
      $username = $input["pipname"];
      $content = $input["pipcontent"];

      $length = strlen(string: $content);
  
      if ($username !== '') { // validering: overholde regler for at gemme korrekt data
      
      // Backend validering PT.1 - max 256 tegn i message
        if ($length <= 256) {

          $data = [
              'pipname' => $username,
              'pipcontent' => $content
          ];
          $sql = "INSERT INTO pips VALUES (default, :pipname, :pipcontent, NOW())";
          $stmt= $conn->prepare(query: $sql);
          $stmt->execute(params: $data);
  
  
          $id = $conn->lastInsertId();
          $pip = (object) $input;
          $pip->id = $id;
  
          echo json_encode(value: $pip);
      } else {
          echo json_encode(value: "username skal udfyldes");
      }
    }

    // Backend validering hvis message er tom eller over 250 tegn
      else {
          echo json_encode(value: "message skal udfyldes og må max være 256 tegn");
      }
  }



?>