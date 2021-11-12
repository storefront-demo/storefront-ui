app.controller('OtpController', ['$scope', '$window', '$location', 'UserInfoService', 'CONFIG', 'BlueAPIService', function($scope, $window, $location, UserInfoService, CONFIG, BlueAPIService) {

	console.log("Entering Otp Controller")

	$scope.loggedIn = UserInfoService.state.authenticated
	$scope.otpError = false;

	var token = UserInfoService.state.accessToken

	$scope.submit = function () {
			$scope.payload = {
												'otp':$scope.otp,
											 }

			BlueAPIService.validateOtp(UserInfoService.state.otpToken, $scope.payload, function (response) {
					console.log("Send request for OTP" + response)
					$scope.result = response.data
					$scope.success = true;
					$scope.fail = false;
					if(response.data.assertion){
						$location.path('/customer');
					}
					else{
						$scope.otpError = true;
					}
			}, function (error){
					console.log("Request failed: " + error);
					$scope.success = false;
					$scope.fail = true;
			});

	}

	$scope.getotp = function () {
			$scope.payload = {
												'token':token,
											 }
			BlueAPIService.getOtp(UserInfoService.state.otpToken, $scope.payload, function (response) {
					console.log("Send request for OTP" + response)
					$scope.result = response.data
					$scope.success = true;
					$scope.fail = false;
			}, function (error){
					console.log("Request failed: " + error);
					$scope.success = false;
					$scope.fail = true;
			});
			$window.alert("Please check your registered email for the one time password");
			$location.path("/otp");
	}

}]);
