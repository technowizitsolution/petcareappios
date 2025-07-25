import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
	webClientId: "300121793850-a68mid2ijjf5ve4ht3btqsevlasneipv.apps.googleusercontent.com",
	androidClientId: "300121793850-75oof5ajqj94qnqsdlj35nufhb6lpil7.apps.googleusercontent.com",
	iosClientId: "300121793850-5n9j94bdcoghc4876h8enpjsnv3nenbv.apps.googleusercontent.com",
	scopes: ['profile', 'email'],
});

const GoogleLogin = async () => {
	await GoogleSignin.hasPlayServices();
	const userInfo = await GoogleSignin.signIn();
	return userInfo;
};

export default function Google() {
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
    const [user, setUser] = useState();

	const handleGoogleLogin = async () => {
		setLoading(true);
		try {
			const response = await GoogleLogin();
			const { idToken, user } = response;

            console.log('User:', user);
			// if (idToken) {
			// 	const resp = await authAPI.validateToken({
			// 		token: idToken,
			// 		email: user.email,
			// 	});
			// 	await handlePostLoginData(resp.data);
			// }
		} catch (apiError) {
			setError(
				apiError?.response?.data?.error?.message || 'Something went wrong'
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View>
			<Pressable onPress={handleGoogleLogin}>Continue with Google</Pressable>
		</View>
	);
}