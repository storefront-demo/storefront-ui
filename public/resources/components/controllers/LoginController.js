app.controller('LoginController', ['$scope','$location','BlueAPIService','UserInfoService', 'CONFIG', function($scope, $location, BlueAPIService, UserInfoService, CONFIG) {

	console.log("Entering Login Controller")
	$scope.loggedIn = UserInfoService.state.authenticated
	$scope.loginError = false;

	 $scope.save = function (loginForm) {

		 $scope.payload = 'grant_type=password&scope=openid&username='+$scope.username+'&password='+$scope.password

		 BlueAPIService.loginUser($scope.payload, function (response) {
	 			console.log("Login Result" + response)
				//GK We don't want to propogate the access token so comment out the next line
				//GK UserInfoService.state.accessToken = response.data.access_token
				//GK instead we want to propogate the id token which contains more claims info in it such as email and other stuff
				UserInfoService.state.accessToken = response.data.id_token
				UserInfoService.state.authenticated = true;
				$location.path('/catalog');

	 		}, function (error){
	 			console.log("Login Error: " + error);
				$scope.loginError = true;
	 	});

	 }
}]);
