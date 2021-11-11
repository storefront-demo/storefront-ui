app.controller('OtpController', ['$scope', '$window', '$location', 'UserInfoService', 'CONFIG', 'BlueAPIService', function($scope, $window, $location, UserInfoService, CONFIG, BlueAPIService) {

	console.log("Entering Otp Controller")

	$scope.loggedIn = UserInfoService.state.authenticated

	var token = UserInfoService.state.accessToken

	$scope.submit = function () {
			$scope.payload = {
												'otp':$scope.otp,
											 }

			var validateotp = BlueAPIService.validateOtp(UserInfoService.state.otpToken, $scope.payload, function (response) {
					console.log("Send request for OTP" + response)
					$scope.result = response.data
					$scope.success = true;
					$scope.fail = false;
					$location.path("/customer");
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
