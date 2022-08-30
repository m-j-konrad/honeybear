<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Honeybear Highscore</title>
	</head>

	<body>
		<br><br>
		<h3 align="center">
			<a href="https://game.location">nochmal spielen!</p></a>
		</h3>
		<br><br>
		<h1 align="center">Die 25 Besten</h1>
		<h2>
		<br>
		<table align="center">
		<?php
			$db = new mysqli('localhost', 'USER', 'PASSWORD', 'DATABASE');
			if($db->connect_errno > 0) {
				die('Konnte nicht mit MySQL verbinden. Fehler: ' . $db->connect_error);
			}

			if (isset($_GET['show'])) {
				$sql = "SELECT * from DATABASE ORDER BY score DESC LIMIT 0,25";
				$highscores = $db->query($sql);

				if ($highscores  ===  false)
				die('MySQL Fehler: ' . $db->error);

				while ($highscore = $highscores->fetch_object()) {
					echo "<tr><td>";
					echo $highscore->name . "</td><td style=\"color:red\">" . $highscore->score;
					echo "</td></tr>";
				}
			}
                        if (isset($_POST['name'])) {
				$score_exists = isset($_POST['score']);
				$name_exists = isset($_POST['name']);

				if ($score_exists == true && $name_exists) {
					$sql ="INSERT INTO DATABASE (name, score)
								VALUES (?, ?)";
					$stmt = $db->prepare($sql);

					if ($stmt === false)
						die('MySQL Fehler: ' . $db->error);

					$stmt->bind_param('si', $_POST['name'], $_POST['score']);
					$stmt->execute();

					echo 'Die Score für ' . $_POST['name'] . ' ist ' . $_POST['score'];
				}
				else
					echo 'Keine Score oder Name angegeben!';
			}
		?>
		</table>
		</h2>
	</body>
</html>
