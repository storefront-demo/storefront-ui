app.controller('PaymentsController', ['$scope', '$window', '$location', 'UserInfoService', 'CONFIG', 'BlueAPIService', function($scope, $window, $location, UserInfoService, CONFIG, BlueAPIService) {

	console.log("Entering Payments Controller")

	$scope.loggedIn = UserInfoService.state.authenticated

	BlueAPIService.getBillingInfo(UserInfoService.state.otpToken, function (response) {
			var billingInfo = response.data;
			$scope.billingInfo = billingInfo;
		}, function (error){
			console.log("Customer Profile Error: " + error);
	});

	$scope.pay = function () {
		  console.log($scope.cardNum)
		  if ($scope.cardNum != "1111 2222 3333 4444") {
								$window.alert("Invalid Card details, please enter the correct details");
								$location.path("/payments");
						}
			else {
        $window.alert("Payment Successful");
				$location.path("/catalog");
			}
		}
}]);
