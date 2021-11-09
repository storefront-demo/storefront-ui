app.controller('OtpController', ['$scope', '$window', '$location', 'UserInfoService', 'CONFIG', 'BlueAPIService', function($scope, $window, $location, UserInfoService, CONFIG, BlueAPIService) {

	console.log("Entering Otp Controller")

	$scope.loggedIn = UserInfoService.state.authenticated

	$scope.submit = function () {
		  console.log($scope.otp)
		  if ($scope.otp != "12345") {
								$window.alert("Invalid OTP, please check your registered email or mobile number");
								$location.path("/otp");
						}
			else {
				$location.path("/customer");
			}
		}

	$scope.getotp = function () {
			BlueAPIService.getOtp(UserInfoService.state.otpToken, function (response) {
					console.log("Send request for OTP" + response)
					$scope.result = response.data
					$scope.success = true;
					$scope.fail = false;
			}, function (error){
					console.log("Request failed: " + error);
					$scope.success = false;
					$scope.fail = true;
			});
			$window.alert("Please check your registered email or mobile number for the one password");
			$location.path("/otp");
	}

}]);
