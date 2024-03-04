import { SeatRequester } from './library/handlers/SeatRequester';

export class SeatRoleApplier {
	private seatRequester: SeatRequester = new SeatRequester();
	private seatUsersCache = new Map<string, SeatUser>();


	/**
	 * mainCharacterName에 해당하는 seatUserId를 가져옵니다.
	 * @param {string} mainCharacterName
	 * @returns {Promise<string>}
	 */
	async getSeatUserId(mainCharacterName: string): Promise<string> {
		let user = this.seatUsersCache.get(mainCharacterName);
		let seatUserIndex = 1;

		while (user === undefined) {
			const seatUsers = (await this.seatRequester.getSeatUsers(seatUserIndex)).data;

			for (const seatUser of seatUsers) {
				this.seatUsersCache.set(seatUser.name, seatUser);

				if (seatUser.name === mainCharacterName) {
					user = seatUser;
				}
			}

			seatUserIndex++;
		}

		return user.id.toString();
	}

	/**
	 * seatUserId에 해당하는 유저에게 뉴비 롤을 부여합니다.
	 * @param {string} mainCharacterName
	 * @param {string} roleId
	 */
	async add(mainCharacterName: string, roleId: string) {
		const seatUserId = await this.getSeatUserId(mainCharacterName);
		await this.seatRequester.userRoleAdd(seatUserId, roleId);
	}

	/**
	 * seatUserId에 해당하는 유저에게 roleId에 해당하는 롤을 제거합니다.
	 * @param {string} mainCharacterName
	 * @param {string} roleId
	 */
	async remove(mainCharacterName: string, roleId: string) {
		const seatUserId = await this.getSeatUserId(mainCharacterName);
		await this.seatRequester.userRoleRemove(seatUserId, roleId);
	}
}

interface SeatUser {
    id: number,
    name: string,
    email: string,
    active: boolean,
    last_login: string,
    last_login_source: string,
    associated_character_ids: string[],
    main_character_id: string,
}