<?php

class Database{
	// Host, Root, Password
	private $database_access_names = array("localhost","root","");
	
	// Name of the Database to be accessed
	private $database_name = "banku_db";
	
	// Database Connection (default = null)
	public $connDB = "";
	
	function __construct(){
		if (!$this->connDB){
			$this->connectToDatabaseMySQL();
		}
	}
	
	// Connecting to the Database
	function connectToDatabaseMySQL(){
		try {
			$this->connDB = mysqli_connect($this->database_access_names[0],
									$this->database_access_names[1],
									$this->database_access_names[2],
									$this->database_name);
		} catch (mysqli_sql_exception)	{
			echo "Error Code 001: Cannot Connect to the Database.\n";
		}
		return;
	}

	function getConnection(){
		return $this->connDB;
	}
}
?>