import {Document} from 'mongoose';
import updateNickname from '../../../commands/util/updateNickname';
import User from '../../../repository/User';

export default () => {
    it("Should update user's nickname correctly", async () => {
        await updateNickname('eoraNew', '511136514940469249', '629255459454320640');
        const user = await User.findOne({
            _id: '60f038113761d646fd027984',
        });
        expect(user).toBeTruthy();
        expect(user).toBeInstanceOf(Document);
        expect(user).toHaveProperty('nickname', 'eoraNew');
    });
};
