<?php
    session_start();
    require_once("connectToDB.php");

    // Database Connection
    $connDB = new Database();
    $conn = $connDB->getConnection();
    $accountTableName = 'account';

    // Class Variable
    $accKey = '';

    if(isset($_SESSION['account_key'])){

        $accKey = $_SESSION['account_key'];
    } else {
        // Error Page
    }

    function checkBalance(){
        global $accKey, $accountTableName, $conn;

        $query = "SELECT account_balance from $accountTableName WHERE account_id = $accKey";

        $stmt = $conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();

        if($row = $result->fetch_assoc()){
            // Successfully Retrieve the Balance
            
        } else {
            // Failed to Retrieve Balance
        }
    }

    function transferFunds(){
        global $accKey, $accountTableName, $conn;

        // Local Variables (Defaulted)
        $transferAmount = -1.00;
        $transferAccKey = -1;
        $defaultMinimumTransferAmount = 1.00;

        // Acquiring values from UI
        if(isset($_POST['transferAccountKey']) && isset($_POST['transferAmount'])){
            $transferAccKey = $_POST['transferAccountKey'];
            $transferAmount = $_POST['transferAmount'];
        } else {
            // Fail to Retrieve Transfer Account Key
        }
        
        // Verifying Sufficient Funds
        $verifyQuery = "SELECT account_balance from $accountTableName WHERE account_id = $accKey";
        $verifystmt = $conn->prepare($verifyQuery);
        $verifystmt->execute();
        $verifyresult = $verifystmt->get_result();

        if($row = $verifyresult->fetch_assoc()){
            if($row - $transferAmount >= $defaultMinimumTransferAmount){
                // Minimum Transfer Amount and Funds are Sufficient
                $originAccountNewBalance = $row - $transferAmount;

                // Verify if the target account is existing.
                $verifyQuery = "SELECT * from $accountTableName WHERE account_id = $transferAccKey";
                $verifystmt = $conn->prepare($verifyQuery);
                $verifystmt->execute();
                $verifyresult = $verifystmt->get_result();

                if ($row = $verifyresult->fetch_assoc()){
                    // Transfer Account is Verified
                    $originQuery = "UPDATE account SET account_balance = $originAccountNewBalance WHERE account_id = $transferAccKey";
                    $originstmt = $conn->prepare($originQuery);
                }


            } else {
                // Does not Meet the Miminum Transfer Amount
                
            }
        } else {
            // Failed to Retreive Balance
        }



    }
    
?>