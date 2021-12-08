app.controller('PaymentsController', ['$scope', '$window', '$location', 'UserInfoService', 'CONFIG', 'BlueAPIService', function($scope, $window, $location, UserInfoService, CONFIG, BlueAPIService) {

	console.log("Entering Payments Controller")

	$scope.loggedIn = UserInfoService.state.authenticated

	$scope.billingInfo = null

	BlueAPIService.getBillingInfo(UserInfoService.state.otpToken, function (response) {
		  console.log("Get request for billing info" + response)
			var billingInfo = response.data;
			$scope.billingInfo = billingInfo;
		}, function (error){
			console.log("Customer Profile Error: " + error);
	});

	$scope.pay = function () {
		  // console.log($scope.cardNum)

			$scope.payload = {
										    'emails': $scope.billingInfo.emails,
										    'addresses': $scope.billingInfo.addresses,
										    'meta': $scope.billingInfo.meta,
										    'schemas': $scope.billingInfo.schemas,
										    'cardno': $scope.cardNum,
										    'name': $scope.billingInfo.name,
										    'groups': $scope.billingInfo.groups,
										    'active': $scope.billingInfo.active,
										    'id': $scope.billingInfo.id,
										    'userName': $scope.billingInfo.userName,
										    'phoneNumbers': $scope.billingInfo.phoneNumbers
										}

			var pattern = /[0-9\s]{13,19}/;
			var isValid = false;

			if (pattern.test($scope.cardNum)) {
				isValid = true;
			}

			if(isValid) {
				BlueAPIService.putCCInfo(UserInfoService.state.otpToken, $scope.payload, function (response) {
						console.log("Send request for CC" + response)
						$scope.result = response.data
						$scope.success = true;
						$scope.fail = false;
				}, function (error){
						console.log("Request failed: " + error);
						$scope.success = false;
						$scope.fail = true;
				});
				$window.alert("Payment Successful");
				$location.path("/catalog");
		  } else {
				$window.alert("Invalid Card details, please enter the correct details");
				$location.path("/payments");
		  }

		}
}]);
